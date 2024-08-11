#!/bin/bash

# directories=(
#   "modules/open-pr"
#   "modules/release"
#   "modules/task-status-comments"
#   "modules/sync-files-pull-request"
# )

# for dir in "${directories[@]}"; do
#   cd "$dir" && npm run build && cd ..
# done

#!/bin/bash

parent_directory="modules"

for dir in "$parent_directory"/*/; do
  if [ -d "$dir" ]; then
    cd "$dir" && npm run build && cd - > /dev/null
  fi
done

git add . && 
git commit -m 'build' && 
git push origin main && 
git tag main-v1 -f && 
git push origin main-v1 -f &&
vercel deploy --prod
