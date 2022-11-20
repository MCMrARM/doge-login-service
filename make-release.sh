rm -rf release release.tar.gz
mkdir release
cp -r {build,jwt-private.pem,jwt-public.pem,package.json,package-lock.json} release

cd release
tar -czf ../release.tar.gz .
cd ..
rm -rf release
