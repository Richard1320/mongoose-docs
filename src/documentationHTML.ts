import fs from "fs";
import path from "path";
import {IMongooseDocsSchema} from "../types";
import writeFile from "./writeFile";

/**
 * Escape HTML special characters like quotes and brackets.
 * @param string
 */
function escapeHtml(string: string): string {
	const entityMap: { [entity: string]: string } = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;'
	};
	return string.replace(/[&<>"'`=\/]/g, function (s) {
		return entityMap[s];
	});
}

/**
 * Generate anchor tag for a schema type.
 * @param fieldType
 */
function schemaTypeAnchor(fieldType: string): string {
	const officialSchemaTypeUrl = "https://mongoosejs.com/docs/schematypes.html";
	let schemaTypeUrl: string = "";
	switch (fieldType) {
		case "String":
		case "Number":
		case "Date":
		case "Buffer":
		case "Boolean":
		case "ObjectID":
		case "Array":
		case "Map":
			schemaTypeUrl = `${officialSchemaTypeUrl}#${fieldType.toLowerCase()}s`;
			break;
		case "Mixed":
			schemaTypeUrl = `${officialSchemaTypeUrl}#${fieldType.toLowerCase()}`;
			break;
		case "Decimal128":
			schemaTypeUrl = `${officialSchemaTypeUrl}#mongoose_Mongoose-Decimal128`;
			break;
	}

	if (schemaTypeUrl) {
		return `<a href="${schemaTypeUrl}" target="_blank" rel="noopener noreferrer">${fieldType}</a>`;
	} else {
		return fieldType;
	}

}

/**
 * Generate HTML code for bootstrap navigation to other schemas.
 * @param mongooseSchemas
 * @param modelName
 */
function generateNavigation(mongooseSchemas: IMongooseDocsSchema[], modelName?: string): string {
	const anchorLinks: string[] = mongooseSchemas.map((schema) => {
		const title = (schema.comment) ? escapeHtml(schema.comment) : "";
		const classes = `nav-link mb-3 border ${(schema.name === modelName) ? "active" : ""}`
		return `
			<a class="${classes}" title="${title}" href="./${schema.name}.html">
				${schema.name}
			</a>`;
	});
	return `
		<h3>Models</h3>
		<div class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
			${anchorLinks.join("")}
		</div>
	`;
}

/**
 * Generate HTML code for a schema table.
 * @param schema
 */
function generateSchemaTable(schema: IMongooseDocsSchema): string {
	const fieldRows: string[] = Object.keys(schema.fields).map((fieldName: string) => {
		const field = schema.fields[fieldName];
		let nestedSchema: string = "";
		if (field.nestedSchema !== undefined) {
			nestedSchema = (typeof field.nestedSchema === "string") ? field.nestedSchema : JSON.stringify(field.nestedSchema);
		}
		return `
			<tr>
				<td>${fieldName}</td>
				<td>${schemaTypeAnchor(field.type)}</td>
				<td>${(field.comment !== undefined) ? escapeHtml(field.comment) : ""}</td>
				<td>${(field.required) ? "True" : "False"}</td>
				<td>${(field.default !== undefined) ? field.default : ""}</td>
				<td>${(field.min !== undefined) ? field.min : ""}</td>
				<td>${(field.max !== undefined) ? field.max : ""}</td>
				<td>${nestedSchema}</td>
			</tr>
		`;
	});
	return `
		<div class="table-responsive">	
			<table class="table table-striped table-bordered">
			<thead>
				<tr>
					<th>Field Name</th>
					<th>Field Type</th>
					<th>Comment</th>
					<th>Required</th>
					<th>Default</th>
					<th>Min</th>
					<th>Max</th>
					<th>Nested Schema</th>
				</tr>
			</thead>
			<tbody>
				${fieldRows.join("")}
			</tbody>
		</table>
		</div>
	`;
}

/**
 * Generate HTML code for documentation index.
 * @param mongooseSchemas
 */
function mongooseDocsGenerateIndexHTML(mongooseSchemas: IMongooseDocsSchema[]): string {
	return `<!DOCTYPE HTML>
		<html lang="en">
		<head>
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
			<title>Mongoose Docs</title>
			<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" 
				integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous"/>
		</head>
		<body>
			<div class="container py-5">
				<div class="row">
					<div class="col-12 col-md-3">
						${generateNavigation(mongooseSchemas)}
					</div>
					<div class="col-12 col-md-9">
						<h1>Mongoose Docs</h1>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
}

/**
 * Generate HTML code for a single schema.
 * @param mongooseSchemas
 * @param modelName
 */
function mongooseDocsGenerateSchemaHTML(mongooseSchemas: IMongooseDocsSchema[], modelName: string): string {
	const currentSchema: IMongooseDocsSchema = mongooseSchemas.find((schema) => schema.name === modelName) as IMongooseDocsSchema;

	if (!currentSchema) return "";

	return `<!DOCTYPE HTML>
		<html lang="en">
		<head>
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
			<title>Mongoose Docs for ${modelName} model</title>
			<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" 
				integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous"/>
		</head>
		<body>
			<div class="container py-5">
				<div class="row">
					<div class="col-12 col-md-3">
						${generateNavigation(mongooseSchemas, modelName)}
					</div>
					<div class="col-12 col-md-9">
						<h1>Mongoose Docs for ${modelName} model</h1>
						<div class="mb-3">${currentSchema.comment}</div>
						${generateSchemaTable(currentSchema)}
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
}

/**
 * Write documentation as HTML files for all available schemas.
 * @param mongooseSchemas Schema structure returned from `mongooseDocsJSON` function.
 * @param fileDirectory Directory to write the documentation HTML files.
 */
export function mongooseDocsOutputHTML(mongooseSchemas: IMongooseDocsSchema[], fileDirectory: string): void {
	const lastChar: string = fileDirectory.substr(-1); // Selects the last character
	if (lastChar != '/') {                                  // If the last character is not a slash
		fileDirectory = fileDirectory + '/';                // Append a slash to it.
	}

	// Make directory if it does not exist
	if (!fs.existsSync(fileDirectory)) {
		try {
			fs.mkdirSync(fileDirectory, {recursive: true});
		} catch (err) {
			console.error(`Error creating directory "${fileDirectory}"`, err);
		}
	}

	// Write out HTML files
	writeFile(mongooseDocsGenerateIndexHTML(mongooseSchemas), path.join(fileDirectory, "index.html"));
	mongooseSchemas.forEach((schema) => {
		writeFile(mongooseDocsGenerateSchemaHTML(mongooseSchemas, schema.name), path.join(fileDirectory, `${schema.name}.html`));
	});

	console.log(`documentation files written to ${fileDirectory}`);

}

