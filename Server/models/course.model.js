import {model , Schema} from "mongoose";

/**
 * @courseSchema - Mongoose schema for Course.
 * This schema defines the structure and validation rules for course data, including title, description, category, thumbnail, lectures, and metadata.
 */

const courseSchema = new Schema({
    title:{
        type:String,
        required:[true, "Title is required" ],
        minLength:[8, "Title must be atleast 8 characters"],
        maxLength:[60,"Title should be less than 60 characters"],
        trim:true
    },
    description:{
        type: String,
        required:[true, "Description is required" ],
        minLength:[8, "Description must be atleast 8 characters"],
        maxLength:[200,"Description should be less than 200 characters"],
        trim:true
    },
    category:{
        type:String,
        required:[true, "Category is required" ],
    },
    thumbnail:{
        public_id:{
            type:String,
            required:true,
        },
        secure_url:{
            type:String,
            required:true,
        }
    },
    lectures:[
        {
            title:String,
            description:String,
            lecture:{
                public_id:{
                    type:String,
                    default: '',
                },
                secure_url:{
                    type:String,
                    default: '',
                }
            },
            materials:[
                {
                    type:{
                        type:String,
                        enum:['text','link','file'],
                        required:true,
                    },
                    title:{ type:String, required:true },
                    content: String,
                    url: String,
                    file:{
                        public_id: String,
                        secure_url: String,
                        originalName: String,
                    },
                }
            ],
            quiz:{
                title: String,
                passingScore:{ type:Number, default:70 },
                questions:[
                    {
                        text:{ type:String },
                        options:[{ type:String }],
                        correctIndex:{ type:Number },
                        explanation: String,
                    }
                ],
            },
        }
    ],
    numberOfLectures:{
        type:Number,
        default:0,
    },
    createdBy:{
        type:String,
        required:true,
    },
    isPublic:{
        type: Boolean,
        default: false,
    },
    assignedTo:[{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }]

},{
    timestamps:true
})

const Course = model('Course', courseSchema);

export default Course;