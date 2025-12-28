import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string; // ADMIN, EMPLOYEE, AGENCY

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions: Types.ObjectId[];

  @Prop({ default: false })
  isSuperAdmin: boolean;

}

export const RoleSchema = SchemaFactory.createForClass(Role);

