import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../androidProjectData';

export async function exportAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const rootFolder = zip.folder('PoojaAssistant') || zip;

  for (const file of ANDROID_PROJECT_FILES) {
    rootFolder.file(file.path, file.content);
  }

  // Also include gradlew wrapper script placeholder for quick CLI usage
  rootFolder.file('gradlew', `#!/usr/bin/env sh
# Gradle wrapper script for Pooja Assistant
exec gradle "$@"
`);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
