import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [100, "Name must be at most 50 characters long"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be a positive number"],
    },
    currency: {
        type: String,
        required: [true, "Currency is required"],
        enum: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD"],
    },
    //how ofter you are gtting charged for that subscription is given by frequency
    frequency: {
        type: String,
        required: [true, "Frequency is required"],
        enum: ["daily", "weekly", "monthly", "yearly"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ["entertainment", "education", "health", "fitness", "food", "travel"],
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
        enum: ["credit_card", "debit_card", "paypal", "bank_transfer"],
    },
    status: {
        type: String,
        required: [true, "Status is required"],
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"],
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: "Start date must be in the past",
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function(value) {
                return value > this.startDate;
            },
            message: "Renewal date must be after start date",
        }
    },
    user: {
        // we are going to use the user id (from the request body we attached during signing-in in the authorize middleware) to link the subscription to the user
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        //this is to make sure that the user id is valid
        index: true,
    }
}, {timestamps: true});

// we will create function which will happen before the subscription is saved to the database
// auto calculate the renewal date based on the frequency
subscriptionSchema.pre("save", function(next) {
    if(!this.renewalDate){
        const renewalPeriods= {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
        // auto update the status if the renewal date is passed
        if(this.renewalDate < new Date()){
            this.status = "expired";
        }
    }
    next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;