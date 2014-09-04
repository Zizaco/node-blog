REPORTER = list
MOCHA_OPTS = --ui bdd -c

start:
	TWITTER_CONSUMER_KEY=ZbpGIrPK2dJWRVLlTdJSRAcCS \
	TWITTER_CONSUMER_SECRET=VSJjbBj32WfEaOEqpYyr8Y1fRA6HVHj7ykkWSxJ3OVwj6XDNH5 \
	node app

test:
	clear
	echo Starting test
	./node_modules/mocha/bin/mocha \
	-R $(REPORTER) \
	--growl \
	$(MOCHA_OPTS) \
	test/*.js
	echo Ending test

test-w:
	./node_modules/mocha/bin/mocha \
	-R $(REPORTER) \
	--growl \
	--watch
	$(MOCHA_OPTS) \
	test/*.js

.PHONY: test start
