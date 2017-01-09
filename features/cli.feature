Feature: Indexer
    As a consumer of Proven depositions
    I want to index depositions as they are published
    So that I can search efficiently

    Scenario: A single deposition published
        Given an Ethereum blockchain in a known state
        And a running Ethereum client
        And a running miner
        And an initialized IPFS client
        And a running IPFS daemon
        And a published Proven enclosure
        When I run the indexer
        And a deposition is published
        Then the deposition metadata should be in the database (after a slight delay)
