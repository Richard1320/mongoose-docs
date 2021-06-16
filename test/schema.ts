import  { Schema }  from 'mongoose';

const categoryOptions = {
	timestamps: false,
	comment: "This collection contains all the categories for the blog."
}
export const categorySchema = new Schema({
	name: {
		type: String,
		comment: "This is the name of the category",
		required: true,
	},
	slug: {
		type: String,
		comment: "This is the slug for the category",
		required: true,
	},
}, categoryOptions);

const blogOptions = {
	timestamps: true,
	comment: "This collection contains all the blog posts for \"My Kid's Recipes\"."
}
export const blogSchema = new Schema({
	title: {
		type: String,
		required: true,
		comment: "This is the post title",
	},
	contributors: {
		type: [String],
		comment: "This is a list of contributors",
	},
	body: {
		type: String,
		comment: "This is the post content",
	},
	rating: {
		type: Number,
		min: 1,
		max: 10,
		comment: "This is the review score for that the author has given for the topic. ",
	},
	comments: {
		comment: "This is an array of comments",
		type: [{
			body: {
				type: String,
				comment: "This is the comment body",
			},
			date: {
				type: Date,
				comment: "This is the comment date",
			}
		}],
	},
	date: {
		type: Date,
		default: Date.now,
		comment: "This is the frontend display date for the post",
	},
	hidden: {
		type: Boolean,
		comment: "This is a flag to check whether or not the post is visible to the public",
	},
	meta: {
		comment: "This contains meta data relating to this post",
		type: {
			views: {
				type:Number,
				default:0,
				comment: "This is the number of times this post has been viewed",
			},
			likes:  {
				type:Number,
				default:0,
				comment: "This is the number of likes",
			},
		}
	},
	categoryId: {
		type: Schema.Types.ObjectId,
		ref: "Category",
		comment: "This is the category of the blog post",
	},
	apiResponse: {
		type: Schema.Types.Mixed,
		comment: "This is the response when submitting the post to the 3rd party API",
	},
}, blogOptions);
