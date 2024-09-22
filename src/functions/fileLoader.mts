import { glob, Path } from "glob";

export async function loadFiles(dirName: string): Promise<string[] | Path[]> {
    return await glob(`${process.cwd().replace(/\\/g, "/")}/src/${dirName}/**/*.{ts,mts}`);
}