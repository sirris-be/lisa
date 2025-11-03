# Build the Docker image for the LISA site
build:
	docker build --platform linux/amd64 -t lisa-site .

# Serve the Jekyll site locally with live reload
serve: build
	docker run --rm -p 4000:4000 -v "$$PWD":/srv/jekyll lisa-site
