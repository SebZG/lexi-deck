/** @type {import('jest').Config} */
export default {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.js$": "babel-jest"
    }
};