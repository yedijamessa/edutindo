// Firebase Storage service functions
import { storage } from "./firebase";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    UploadTask
} from "firebase/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadProgress {
    progress: number; // 0-100
    bytesTransferred: number;
    totalBytes: number;
}

export async function uploadFile(
    studentId: string,
    file: File,
    folder: string = 'general',
    onProgress?: (progress: UploadProgress) => void
): Promise<string> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `students/${studentId}/${folder}/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress?.({
                    progress,
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes
                });
            },
            (error) => {
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(storagePath);
            }
        );
    });
}

export async function getFileDownloadURL(storagePath: string): Promise<string> {
    const storageRef = ref(storage, storagePath);
    return getDownloadURL(storageRef);
}

export async function deleteFile(storagePath: string): Promise<void> {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
}

export async function listFiles(studentId: string, folder: string = 'general'): Promise<string[]> {
    const folderRef = ref(storage, `students/${studentId}/${folder}`);
    const result = await listAll(folderRef);
    return result.items.map(item => item.fullPath);
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
