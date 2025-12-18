# Setup the development environment
setup:
	npm install
	git config core.hooksPath .githooks || true

# Generate ICS files for events
gen-ics:
	node lib/gen-ics.mjs

# Build the Docker image for the LISA site
build: gen-ics
	docker build --platform linux/amd64 -t lisa-site .

# Serve the Jekyll site locally with live reload
serve: build
	docker run --rm -p 4000:4000 -v "$$PWD":/srv/jekyll lisa-site
