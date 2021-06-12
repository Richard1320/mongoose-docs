import {Mongoose, Schema, SchemaType, SchemaTypeOptions} from "mongoose";
import {IMongooseDocsSchema, IMongooseDocsSchemaField, TMongooseDocsFieldsObject} from "../types";

function parseOptions(options: SchemaTypeOptions<any>): IMongooseDocsSchemaField {
	return {
		type: options.type,
		comment: options.comment,
		min: options.min,
		max: options.max,
		default: options.default,
		required: (!!options.required),
	};
}

function parseField(path: SchemaType): IMongooseDocsSchemaField {
	const options: SchemaTypeOptions<any> = (path as unknown as any).options;
	let type: string = (path as unknown as any).instance;
	let nestedSchema: TMongooseDocsFieldsObject | string | undefined = undefined;
	if (type === "Array") {
		if ((path as unknown as any).schema) {
			// This is an array with a custom schema.
			nestedSchema = mongooseDocsSchemaJSON((path as unknown as any).schema);
		} else {
			// This is an array containing a basic type and not a custom schema.
			nestedSchema = options.type[0].name;
		}
	} else if (type === "Mixed" && options.type && typeof options.type === "object") {
		// This is a mixed type with a custom schema.
		nestedSchema = {};
		const fieldNames: string[] = Object.keys(options.type);
		fieldNames.forEach((fieldName: string) => {
			(nestedSchema as TMongooseDocsFieldsObject)[fieldName] = parseOptions(options.type[fieldName]);
		});
	}

	return {
		type,
		comment: options.comment,
		min: options.min,
		max: options.max,
		default: options.default,
		required: (!!options.required),
		nestedSchema,
	};
}

export function mongooseDocsSchemaJSON(schema: Schema): TMongooseDocsFieldsObject {
	const fieldNames: string[] = Object.keys(schema.paths);
	const fieldsStructured: TMongooseDocsFieldsObject = {};
	fieldNames.forEach((fieldName: string) => {
		fieldsStructured[fieldName] = parseField(schema.paths[fieldName]);
	});
	return fieldsStructured;
}

export function mongooseDocsJSON(mongoose: Mongoose): IMongooseDocsSchema[] {
	// "Mongoose" type does not have "modelSchemas" property. The property does exist in the mongoose object.
	const modelSchemas: {[key: string] : Schema } = (mongoose as unknown as any).modelSchemas;

	return Object.keys(modelSchemas).map((modelName: string) => {
		const schema: Schema = modelSchemas[modelName];

		return {
			name: modelName,
			fields: mongooseDocsSchemaJSON(schema),
		};
	});

}
