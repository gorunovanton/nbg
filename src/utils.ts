import * as fs from "fs-extra";

export function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

export function toCamelCase(str: string) {
    return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
}

export async function saveWithoutOverride(filename: string, data: string) {
    if (await fs.pathExists(filename)) {
        const oldData = await fs.readFile(filename);
        if (oldData.toString() === data) {
            return
        }
    }

    await fs.writeFile(filename, data);
}