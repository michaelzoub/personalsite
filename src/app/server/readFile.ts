import fs from 'fs/promises'
import path from 'path';

export async function readFile() {
    try {
        console.log('trying readFile')
        const filePath = path.join(process.cwd(), 'src/app/data', 'upvotecount.txt')
        const data = await fs.readFile(filePath, 'utf-8')
        console.log(parseInt(data, 10))
        return parseInt(data, 10)
    } catch (error) {
        console.log('error')
        throw error
    }
}


