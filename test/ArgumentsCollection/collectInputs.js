const expect = require("chai").expect;
const ArgumentsCollection = require("../../dist/ArgumentsCollection").ArgumentsCollection;

exports.runTests = () => {
    it("collects --files-root-dir", () => {
        // Arrange
        const collection = new ArgumentsCollection();
        const filesRootDir = "aaa";

        // Act
        collection.collectInputs(["--files-root-dir", filesRootDir]);

        // Assert
        expect(collection.getFilesRootDir()).to.be.equal(filesRootDir);
    });

    it("collects --file-list-file", () => {
        // Arrange
        const collection = new ArgumentsCollection();
        const fileListFile = "aaa";

        // Act
        collection.collectInputs(["--file-list-file", fileListFile]);

        // Assert
        expect(collection.getFileListFile()).to.be.equal(fileListFile);
    });

    it("throws on an unknown input", () => {
        // Arrange
        const collection = new ArgumentsCollection();

        // Act
        const test = () => collection.collectInputs(["--fake"]);

        // Assert
        expect(test).to.throw();
    });
};
