import {NativeDate} from "mongoose";

export type TMongooseDocsFieldsObject = { [fieldName: string] : IMongooseDocsSchemaField };

export interface IMongooseDocsSchemaField {
	type: string;
	required: boolean;
	comment?: string;
	default?: string;
	min?: number | NativeDate | [number, string] | [NativeDate, string] | readonly [number, string] | readonly [NativeDate, string];
	max?: number | NativeDate | [number, string] | [NativeDate, string] | readonly [number, string] | readonly [NativeDate, string];
	nestedSchema?: TMongooseDocsFieldsObject | string;
}

export interface IMongooseDocsSchema {
	name: string;
	comment?: string;
	fields: TMongooseDocsFieldsObject;
}

