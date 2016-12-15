Feature: Indexer
    As a consumer of Proven depositions
    I want to index depositions as they are published
    So that I can search efficiently

    Scenario: A single deposition published
        Given an indexer
        When I run the indexer
        And a deposition is published
        Then the deposition metadata should be in the database
