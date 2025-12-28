import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import * as bcrypt from 'bcrypt';

@Schema({timestamps :true})
export class User extends Document {
    @Prop({ required: true})
    fullName : string;

    @Prop({ required: true, unique: true})
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Role' })
    roleId: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
