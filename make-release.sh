rm -rf release release.tar.gz
mkdir release
cp -r {build,jwt-private.pem,jwt-public.pem,package.json,package-lock.json} release

tar -czf release.tar.gz release
rm -rf release