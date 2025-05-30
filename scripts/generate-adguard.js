const fs = require("node:fs").promises;
const path = require("node:path");

(async () => {
	try {
		// Define directories
		const baseDir = path.join(__dirname, "..");
		const outputDir = path.join(baseDir, "adguard");

		// Ensure the output directory exists
		await fs.mkdir(outputDir, { recursive: true });

		// Get a list of all .txt files in the base directory
		const files = (await fs.readdir(baseDir)).filter((file) => file.endsWith(".txt"));

		// Process each file concurrently
		await Promise.all(
			files.map(async (file) => {
				try {
					// Read the file contents
					const filePath = path.join(baseDir, file);
					const fileContents = await fs.readFile(filePath, "utf8");

					// Perform transformations for AdGuard format
					const adGuardFileContents = fileContents
						.replace(/^# Title: (.*?)$/gm, "# Title: $1 (adguard)")
						.replace(/^# 0\.0\.0\.0 (.*?) (.*)/gm, "@@||$1^! $2")
						.replace(/0\.0\.0\.0 (.*?)$/gm, "||$1^")
						.replace(/^#/gm, "!");

					// Define output file path
					const outputFilePath = path.join(outputDir, file.replace(".txt", "-ags.txt"));

					// Write modified content to output file
					await fs.writeFile(outputFilePath, adGuardFileContents, "utf8");

					console.log(`Processed: ${file}`);
				} catch (fileError) {
					console.error(`Error processing file "${file}":`, fileError);
				}
			})
		);

		console.log("All files processed successfully.");
	} catch (error) {
		console.error("Error during file processing:", error);
	}
})();
