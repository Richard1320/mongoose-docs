import  mongoose, {Connection} from "mongoose";
import {blogSchema, categorySchema} from "./schema";
import {expect} from "chai";
import {mongooseDocsJSON} from "../dist";
import comparisonJSON from "./comparison.json";
import {IMongooseDocsSchema} from "../types";

describe('Mongoose Instance Docs', () => {
	// Implement mongoose models
	mongoose.model('Category', categorySchema);
	mongoose.model('Blog', blogSchema);

	// Pass in the Mongoose instance with the models implemented.
	const schemaStructure:IMongooseDocsSchema[] = mongooseDocsJSON(mongoose);

	// Properties with undefined values are actually still set. Need to stringify and re-parse the data.
	const schemaJSON:IMongooseDocsSchema[] = JSON.parse(JSON.stringify(schemaStructure));

	it('should match the comparison JSON file', (done) => {
		expect(schemaJSON).to.eql(comparisonJSON);
		done();
	});

});
describe('Mongoose Connection Docs', () => {
	const mongooseConnection: Connection =  mongoose.createConnection();
	// Implement mongoose models
	mongooseConnection.model('Category', categorySchema);
	mongooseConnection.model('Blog', blogSchema);

	// Pass in the Mongoose instance with the models implemented.
	const schemaStructure:IMongooseDocsSchema[] = mongooseDocsJSON(mongooseConnection);

	// Properties with undefined values are actually still set. Need to stringify and re-parse the data.
	const schemaJSON:IMongooseDocsSchema[] = JSON.parse(JSON.stringify(schemaStructure));

	it('should match the comparison JSON file', (done) => {
		expect(schemaJSON).to.eql(comparisonJSON);
		done();
	});

});
