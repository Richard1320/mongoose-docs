import {Connection, Mongoose, Schema, SchemaType, SchemaTypeOptions} from "mongoose";
import {IMongooseDocsSchema, IMongooseDocsSchemaField, TMongooseDocsFieldsObject} from "../types";

/**
 * Analyze the properties for a single field in the schema.
 * @param path
 */
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
	} else if (type === "Embedded" && options && typeof options.type === "object") {
		// This is a mixed type with a custom schema.
		nestedSchema = {};
		const fieldNames: string[] = Object.keys(options.type.paths);
		fieldNames.forEach((fieldName: string) => {
			(nestedSchema as TMongooseDocsFieldsObject)[fieldName] = parseField(options.type.paths[fieldName]);
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

/**
 * Loops through fields in a schema and runs them through the `parseField` function for analysis.
 * @param schema
 */
export function mongooseDocsSchemaJSON(schema: Schema): TMongooseDocsFieldsObject {
	const fieldNames: string[] = Object.keys(schema.paths);
	const fieldsStructured: TMongooseDocsFieldsObject = {};
	fieldNames.forEach((fieldName: string) => {
		fieldsStructured[fieldName] = parseField(schema.paths[fieldName]);
	});
	return fieldsStructured;
}

/**
 * Main function. Takes the Mongoose instance, loops through all the schemas, and returns a JSON array.
 * @param mongooseInstance
 */
export function mongooseDocsJSON(mongooseInstance: Mongoose | Connection): IMongooseDocsSchema[] {
	// "Mongoose" type does not have "modelSchemas" property. The property does exist in the mongoose object.
	// "Connection" type has the main "Mongoose" type in "base" property.
	const mongooseModels: string[] = Object.keys(mongooseInstance.models);

	return mongooseModels.map((modelName: string) => {
		const schema: Schema = (mongooseInstance as unknown as any).model(modelName).schema;

		return {
			name: modelName,
			comment: (schema as any).options.comment,
			fields: mongooseDocsSchemaJSON(schema),
		};
	});

}
