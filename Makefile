.PHONY: server build deploy

server:
	hugo server -D

build:
	hugo --minify

clean:
	rm -rf public resources

new-post:
	hugo new posts/$(name).md
