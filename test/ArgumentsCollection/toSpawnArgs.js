const expect = require("chai").expect;
const ArgumentsCollection = require("../../dist/ArgumentsCollection").ArgumentsCollection;

exports.runTests = () => {
    it("combines a CLI argument", () => {
        // Arrange
        const inputs = ["--exclude", "aaa"];
        const collection = new ArgumentsCollection().collectInputs(inputs);

        // Act
        const spawnArgs = collection.toSpawnArgs();

        // Assert
        expect(spawnArgs).to.be.deep.equal(inputs);
    });

    it("ignores a non- CLI argument", () => {
        // Arrange
        const inputs = ["--file-list-file", "aaa"];
        const collection = new ArgumentsCollection().collectInputs(inputs);

        // Act
        const spawnArgs = collection.toSpawnArgs();

        // Assert
        expect(spawnArgs).to.be.deep.equal([]);
    });
};
