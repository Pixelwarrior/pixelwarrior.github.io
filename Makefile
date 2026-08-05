.PHONY: help serve build clean check post writeup tool preview

help: ## Show this help
	@grep -E '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "};{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

serve: ## Run the dev server with drafts visible (http://localhost:1313)
	hugo server -D --navigateToChanged

preview: ## Run the dev server as production sees it (no drafts)
	hugo server --environment production

build: ## Production build into ./public
	hugo --minify --gc --cleanDestinationDir

clean: ## Remove build output and caches
	rm -rf public resources .hugo_build.lock

check: build ## Build, then assert the important files exist
	@test -s public/index.html   || { echo "FAIL: index.html"; exit 1; }
	@test -s public/sitemap.xml  || { echo "FAIL: sitemap.xml"; exit 1; }
	@test -s public/index.xml    || { echo "FAIL: RSS"; exit 1; }
	@test -s public/index.json   || { echo "FAIL: search index"; exit 1; }
	@test -s public/404.html     || { echo "FAIL: 404"; exit 1; }
	@test -f public/CNAME        || { echo "FAIL: CNAME"; exit 1; }
	@grep -q 'og:image' public/index.html || { echo "FAIL: Open Graph tags"; exit 1; }
	@echo "OK — $$(find public -name '*.html' | wc -l | tr -d ' ') pages built."

post: ## make post name=heap-grooming-glibc-2-39
	@test -n "$(name)" || { echo "usage: make post name=my-post-slug"; exit 1; }
	hugo new content posts/$(name).md

writeup: ## make writeup name=htb-boxname
	@test -n "$(name)" || { echo "usage: make writeup name=box-slug"; exit 1; }
	hugo new content writeups/$(name).md

tool: ## make tool name=my-tool
	@test -n "$(name)" || { echo "usage: make tool name=tool-slug"; exit 1; }
	hugo new content tools/$(name).md
