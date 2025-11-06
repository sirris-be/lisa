# Use the official Jekyll Pages image
FROM jekyll/jekyll:pages

# Set working directory inside the container
WORKDIR /srv/jekyll

# Expose default Jekyll port
EXPOSE 4000

# Install Jekyll for static site generation
# Install Bundler to manage any Ruby dependencies from a Gemfile
# Install WEBrick, which is required by `jekyll serve` in Ruby >= 3
RUN gem install jekyll bundler webrick

# Command to serve the site with live reload
CMD ["jekyll", "serve", "--source", "docs", "--watch", "--force_polling", "--host", "0.0.0.0"]
