-- MySQL 初始化脚本
-- 游戏平台数据库表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) DEFAULT '',
    avatar_url VARCHAR(255) DEFAULT '',
    gender TINYINT DEFAULT 0 COMMENT '0:未知 1:男 2:女',
    level INT DEFAULT 1,
    experience BIGINT DEFAULT 0,
    points INT DEFAULT 0,
    gold_coins BIGINT DEFAULT 0,
    status TINYINT DEFAULT 1 COMMENT '0:禁用 1:正常 2:封禁',
    last_login_time DATETIME DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_level (level),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户角色表
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    body_type TINYINT DEFAULT 1,
    head_config JSON DEFAULT NULL,
    clothing_config JSON DEFAULT NULL,
    jewelry_config JSON DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 好友关系表
CREATE TABLE IF NOT EXISTS friends (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    remark VARCHAR(50) DEFAULT '',
    status TINYINT DEFAULT 1 COMMENT '0:待确认 1:已确认 2:已屏蔽',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id),
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 群组表
CREATE TABLE IF NOT EXISTS groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id BIGINT NOT NULL,
    description TEXT DEFAULT '',
    avatar_url VARCHAR(255) DEFAULT '',
    member_count INT DEFAULT 1,
    max_members INT DEFAULT 100,
    status TINYINT DEFAULT 1 COMMENT '0:解散 1:正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 群组成员表
CREATE TABLE IF NOT EXISTS group_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role TINYINT DEFAULT 0 COMMENT '0:成员 1:管理员 2:群主',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 物品表
CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    type TINYINT NOT NULL COMMENT '1:装备 2:消耗品 3:材料 4:任务物品',
    subtype VARCHAR(50) DEFAULT '',
    icon_url VARCHAR(255) DEFAULT '',
    model_url VARCHAR(255) DEFAULT '',
    max_stack INT DEFAULT 1,
    sellable BOOLEAN DEFAULT TRUE,
    tradeable BOOLEAN DEFAULT TRUE,
    base_price INT DEFAULT 0,
    attributes JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户背包表
CREATE TABLE IF NOT EXISTS user_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    slot_index INT DEFAULT -1,
    bind_type TINYINT DEFAULT 0 COMMENT '0:可交易 1:绑定 2:拾取绑定',
    obtained_from VARCHAR(100) DEFAULT '',
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_item (user_id, item_id, slot_index),
    INDEX idx_user_id (user_id),
    INDEX idx_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 交易订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(64) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    order_type TINYINT NOT NULL COMMENT '1:购买 2:出售 3:赠送 4:兑换',
    total_amount BIGINT NOT NULL,
    payment_method TINYINT DEFAULT 1 COMMENT '1:金币 2:积分 3:混合',
    status TINYINT DEFAULT 0 COMMENT '0:待支付 1:已完成 2:已取消 3:失败',
    items JSON NOT NULL,
    payment_time DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 游戏记录表
CREATE TABLE IF NOT EXISTS game_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    result TINYINT DEFAULT 0 COMMENT '-1:失败 0:平局 1:胜利',
    score_change INT DEFAULT 0,
    points_change INT DEFAULT 0,
    gold_change BIGINT DEFAULT 0,
    difficulty_level INT DEFAULT 1,
    duration INT DEFAULT 0,
    extra_data JSON DEFAULT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_game_id (game_id),
    INDEX idx_played_at (played_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 职业配置表
CREATE TABLE IF NOT EXISTS professions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profession_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT DEFAULT '',
    icon_url VARCHAR(255) DEFAULT '',
    base_attributes JSON DEFAULT NULL,
    skill_tree JSON DEFAULT NULL,
    max_level INT DEFAULT 100,
    score_rules JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_profession_id (profession_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认职业数据
INSERT INTO professions (profession_id, name, description, max_level, score_rules) VALUES
('warrior', '战士', '近战物理攻击职业，擅长使用刀剑武器', 100, '{"base": {"win": 10, "draw": 0, "lose": -10}, "high_level": {"min_level": 9, "multiplier": 9}, "low_level": {"multiplier": 1}}'),
('mage', '法师', '远程魔法攻击职业，擅长元素法术', 100, '{"base": {"win": 10, "draw": 0, "lose": -10}, "high_level": {"min_level": 9, "multiplier": 9}, "low_level": {"multiplier": 1}}'),
('archer', '弓箭手', '远程物理攻击职业，擅长精准射击', 100, '{"base": {"win": 10, "draw": 0, "lose": -10}, "high_level": {"min_level": 9, "multiplier": 9}, "low_level": {"multiplier": 1}}'),
('assassin', '刺客', '高爆发近战职业，擅长隐身和暴击', 100, '{"base": {"win": 10, "draw": 0, "lose": -10}, "high_level": {"min_level": 9, "multiplier": 9}, "low_level": {"multiplier": 1}}');

-- 插入测试用户（密码为 123456）
INSERT INTO users (username, email, password_hash, nickname, level, points, gold_coins) VALUES
('testuser', 'test@example.com', '$2b$10$rQZQvXJzKxJxKxJxKxJxKuOQvXJzKxJxKxJxKxJxKxJxKxJxKxJxK', '测试用户', 1, 100, 1000);

COMMIT;
