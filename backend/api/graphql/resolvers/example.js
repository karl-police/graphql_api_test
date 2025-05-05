/**
 * @typedef {import("hono").Context} Context
 */

export const example_root = {
    random() {
        return Math.random();
    },
    rollThreeDice() {
        return [1, 2, 3].map((_) => 1 + Math.floor(Math.random() * 6));
    },

    rollDice(args) {
        const output = [];
        for (let i = 0; i < args.numDice; i++) {
        output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
        }
        return output;
    },
};


/**
 * 
 * @param {Context} context 
 */
example_root.getIp = function(args, context) {
    return context.req.raw.ip
}


const fakeDatabase = {
    message: "Default Value"
};

function setMessage({ message }) {
    fakeDatabase.message = message;
    return message;
}
function getMessage(args, context) {
    return fakeDatabase.message;
}
example_root.setMessage = setMessage
example_root.getMessage = getMessage
example_root.getMessageUpper = getMessage
example_root.getMessageUpperSpecial = getMessage




example_root.auth_code = function(args, context) {
    context.req.raw.auth_code = args.code
}