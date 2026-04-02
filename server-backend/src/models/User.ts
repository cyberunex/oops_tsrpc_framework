import mongoose from 'mongoose';

const { Schema } = mongoose;

// 用户 Schema (MongoDB - 用于存储频繁变更的信息)
export interface IUser extends mongoose.Document {
    username: string;
    passwordHash: string;
    email?: string;
    level: number;
    score: number;
    gold: number;
    avatar?: string;
    profession?: string;
    lastLoginAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    
    // 方法
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    passwordHash: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 100
    },
    score: {
        type: Number,
        default: 0
    },
    gold: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String,
        default: ''
    },
    profession: {
        type: String,
        enum: ['warrior', 'mage', 'archer', 'healer', 'none'],
        default: 'none'
    },
    lastLoginAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.passwordHash;
            delete ret.__v;
            return ret;
        }
    }
});

// 索引
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ level: -1, score: -1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);
