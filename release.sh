cd translations-open-pr && 
npm run build &&
cd ../translations-release &&
npm run build &&
cd ../translations-task-handler &&
npm run build &&
cd .. && 
git add . && 
git commit -m 'build' && 
git push origin main && 
git tag main-v1 -f && 
git push origin main-v1 -f &&
vercel deploy --prod
