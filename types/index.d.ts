import {Schema} from "mongoose";

export type TMongooseDocsFieldsObject = { [fieldName: string] : IMongooseDocsSchemaField };

export interface IMongooseDocsSchemaField {
	type: string;
	required: boolean;
	comment?: string;
	default?: string;
	min?: number | Schema.Types.Date | [number, string] | [Schema.Types.Date, string] | readonly [number, string] | readonly [Schema.Types.Date, string];
	max?: number | Schema.Types.Date | [number, string] | [Schema.Types.Date, string] | readonly [number, string] | readonly [Schema.Types.Date, string];
	nestedSchema?: TMongooseDocsFieldsObject | string;
}

export interface IMongooseDocsSchema {
	name: string;
	comment?: string;
	fields: TMongooseDocsFieldsObject;
}

