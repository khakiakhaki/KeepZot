@echo off

rem 使用 PowerShell 压缩文件，排除指定文件和文件夹
rem 7z a -aoa keepzot.xpi * -x!Zotero.lnk -x!*.bat -x!0release* -x!*.xpi -x!.vscode -x!keepzotero_update.json -x!.git

7z a -aoa keepzot.xpi locale bootstrap.js manifest.json prefs.js readme.md chrome LICENSE
echo finished

