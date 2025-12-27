import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


@Schema({timestamps :true})
export class Permission extends Document {
    @Prop({ required: true, unique: true })
    key: string; // e.g. CREATE_CLIENT
    
    @Prop()
    description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

