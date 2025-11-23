"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StudentFile } from "@/types/lms";
import { uploadFile, getFileDownloadURL, deleteFile, formatFileSize } from "@/lib/storage-services";
import { saveFileMetadata, deleteFileMetadata } from "@/lib/firestore-services";
import { Upload, File, Download, Trash2, FolderIcon, HardDrive } from "lucide-react";
import { useRouter } from "next/navigation";

interface LockerClientProps {
    initialFiles: StudentFile[];
    initialStorageUsage: number;
    studentId: string;
}

const MAX_STORAGE = 100 * 1024 * 1024; // 100MB

export default function LockerClient({ initialFiles, initialStorageUsage, studentId }: LockerClientProps) {
    const router = useRouter();
    const [files, setFiles] = useState(initialFiles);
    const [storageUsage, setStorageUsage] = useState(initialStorageUsage);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFolder, setSelectedFolder] = useState('general');

    const folders = ['general', 'assignments', 'notes', 'projects'];

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (storageUsage + file.size > MAX_STORAGE) {
            alert('Storage limit exceeded! Please delete some files.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const storagePath = await uploadFile(studentId, file, selectedFolder, (progress) => {
                setUploadProgress(progress.progress);
            });

            await saveFileMetadata({
                studentId,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                storagePath,
                folder: selectedFolder
            });

            setUploadProgress(0);
            router.refresh();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + (error as Error).message);
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const handleDownload = async (file: StudentFile) => {
        try {
            const url = await getFileDownloadURL(file.storagePath);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed');
        }
    };

    const handleDelete = async (file: StudentFile) => {
        if (!confirm(`Delete ${file.fileName}?`)) return;

        try {
            await deleteFile(file.storagePath);
            await deleteFileMetadata(file.id);
            setFiles(files.filter(f => f.id !== file.id));
            setStorageUsage(storageUsage - file.fileSize);
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Delete failed');
        }
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word')) return '📝';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        return '📎';
    };

    const storagePercent = (storageUsage / MAX_STORAGE) * 100;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <HardDrive className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Digital Locker</h1>
                        <p className="text-muted-foreground mt-1">Your personal cloud storage</p>
                    </div>
                </div>
            </div>

            {/* Storage Usage Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Storage Usage</span>
                        <Badge variant={storagePercent > 80 ? 'destructive' : 'default'}>
                            {formatFileSize(storageUsage)} / {formatFileSize(MAX_STORAGE)}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Progress value={storagePercent} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                        {storagePercent.toFixed(1)}% used
                    </p>
                </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Select Folder</label>
                            <select
                                value={selectedFolder}
                                onChange={(e) => setSelectedFolder(e.target.value)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {folders.map(folder => (
                                    <option key={folder} value={folder}>
                                        {folder.charAt(0).toUpperCase() + folder.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <label className="flex-1">
                            <Input
                                type="file"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                                className="cursor-pointer"
                            />
                        </label>
                        <Button disabled={isUploading}>
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                    {isUploading && (
                        <div className="space-y-2">
                            <Progress value={uploadProgress} />
                            <p className="text-sm text-muted-foreground">{uploadProgress.toFixed(0)}% uploaded</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Files List */}
            <div className="space-y-4">
                {folders.map(folder => {
                    const folderFiles = files.filter(f => f.folder === folder);
                    if (folderFiles.length === 0) return null;

                    return (
                        <Card key={folder}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FolderIcon className="w-5 h-5" />
                                    {folder.charAt(0).toUpperCase() + folder.slice(1)}
                                    <Badge variant="outline">{folderFiles.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {folderFiles.map(file => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{file.fileName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDownload(file)}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(file)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {files.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <HardDrive className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No files yet. Upload your first file!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
