.PHONY: setup build build-dev npm-refresh serve doc lint help clean deploy docker

DEPLOY_FOLDER = deploy
DEPLOY_PAGE = index.html
DEPLOY_STYLE = style/style.css style/introjs.css
DEPLOY_JS = dist/bundle.js

solver-cli:
	echo 'node dist/solver-cli.js "$$@"' > $@
	chmod +x solver-cli

setup: ## Setup npm (NECESSARY)
	npm install

build: solver-cli ## Build the typescript code
	./node_modules/webpack/bin/webpack.js

build-dev: solver-cli ## Build the typescript code
	./node_modules/webpack/bin/webpack.js --mode='development'

docker: ## Opens the project folder in a container with npm installed
	docker run --rm -v $$PWD:/project -w=/project -it -p 127.0.0.1:8080:8080 node /bin/bash

deploy: ## Copy files for deployment
	mkdir -p $(DEPLOY_FOLDER)/style $(DEPLOY_FOLDER)/dist
	cp $(DEPLOY_PAGE) $(DEPLOY_FOLDER)
	cp $(DEPLOY_STYLE) $(DEPLOY_FOLDER)/style
	cp $(DEPLOY_JS) $(DEPLOY_FOLDER)/dist

clean: ## Rm built code
	rm -rf dist docs solver-cli $(DEPLOY_FOLDER)

watch: ## Build the code when it is updated
	./node_modules/webpack/bin/webpack.js --watch

serve: ## Serve the web app
	./node_modules/http-server/bin/http-server

run-cli: ## Run the cli app
	node ./dist/solver-cli.js

npm-refresh: ## Hard refresh of the npm files
	rm -rf ./node_modules ./package-lock.json
	npm install

doc: ## Generate documentation
	npx typedoc ./src

lint: ## Lint code
	./node_modules/eslint/bin/eslint.js src

help: ## Show this help
	@perl -e '$(HELP_FUN)' $(MAKEFILE_LIST)

.DEFAULT_GOAL = help
SHELL := /bin/bash

GREEN := $(shell command -v tput >/dev/null 2>&1 && tput -Txterm setaf 2 || echo "")
YELLOW := $(shell command -v tput >/dev/null 2>&1 && tput -Txterm setaf 3 || echo "")
RED := $(shell command -v tput >/dev/null 2>&1 && tput -Txterm setaf 1 || echo "")
RESET := $(shell command -v tput >/dev/null 2>&1 && tput -Txterm sgr0 || echo "")

HELP_FUN = %help; \
	while(<>) { push @{$$help{$$2 // "Other"}}, [$$1, $$3] if /^([a-zA-Z\-._]+)\s*:.*\#\#(?:@([a-zA-Z\-_]+))?\s(.*)$$/ }; \
	print "$(RESET)project: $(PURPLE)$(NAME)$(RESET)\n"; \
	print "usage: make [target]\n\n"; \
	for (sort keys %help) { \
	print "$$_:\n"; \
	for (@{$$help{$$_}}) { \
	$$sep = " " x (25 - length $$_->[0]); \
	print " ${YELLOW}$$_->[0]${RESET}$$sep${GREEN}$$_->[1]${RESET}\n"; \
	}; \
	print "\n"; }
