
# 打包成 ZIP
all:
	tar -cf keepzot.zip chrome locale *.js manifest.json readme.md LICENSE
# 清理生成的文件
clean:
	rm -f keepzot.zip