import fs from 'fs/promises'
import path from 'path'


export async function updateFile(param: any) {
    console.log('updateFile hit')
    try {
    console.log('trying update')
    const filePath = path.join(process.cwd(), '/src/app/data', 'upvotecount.txt')
    fs.writeFile(filePath, param.toString())
    console.log('update')
    } catch(error) {
        console.log('updateFile error')
    }
}
