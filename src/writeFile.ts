import fs from "fs";

/**
 * Function to put content into an actual file on the disk.
 * @param content
 * @param filePath
 */
export default function writeFile(content: string, filePath: string) {
	try {
		const fd = fs.openSync(filePath, "w");
		fs.writeFileSync(fd, content);
		fs.closeSync(fd);
		console.log("file written", filePath);
	} catch (err) {
		console.error("writefile err", err);
	}
}