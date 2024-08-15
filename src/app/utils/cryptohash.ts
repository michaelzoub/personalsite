import crypto from 'crypto'

export function hash(password:any) {
    //salt = random string to add before hashing, keep salt because my security needs aren't immense
    const key = crypto.pbkdf2Sync(password, 'salt', 10, 64, 'sha512');
    return key.toString('hex')
}

