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



const fakeDatabase = {
    message: "Default Value"
};

function setMessage({ message }) {
    fakeDatabase.message = message;
    return message;
}
function getMessage() {
    return fakeDatabase.message;
}
example_root.setMessage = setMessage
example_root.getMessage = getMessage