Feature: CLI
    As a consumer of Proven depositions
    I want to index depositions as they are published
    So that I can search efficiently

    Scenario: Usage
        Given something
        When I run the indexer with no parameters
        Then I should see "Usage"

    Scenario: A single deposition published
        Given a live database
        When I run the indexer
        And a deposition is published
        Then the deposition metadata should be in the database
