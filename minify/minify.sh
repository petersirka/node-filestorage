ECHO "[COMPILING]"
cd ..
ECHO "....... index.js"
uglifyjs index.js -o minify/filestorage/index.js
ECHO "....... utils.js"
uglifyjs utils.js -o minify/filestorage/utils.js

cp readme.md minify/filestorage/readme.md
cp package.json minify/filestorage/package.json
cp license.txt minify/filestorage/license.txt

cd minify
node minify.js