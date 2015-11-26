# TodoDAV
Distributed Authoring &amp; Versioning of Todo Items (aka Universal Cross-Service TODO Lists)

- [Overview](#overview)
- [Data Structures](#data-structures)
  - [Identity](#identity)
  - [Post](#post)
  - [Task](#task)
- [Interface](#interface)
  
## Overview

This work is based on the essay [Universal Todo Lists](https://michaelkarpeles.com/essays/software/universal-todo-list).

## Data Structures

### Identity

For the time being, an identity is an arbitrary entity having a `iid` (identity ID). Identities have cryptographic signatures and can span multiple `agents`

- [?] Signature (crypto)

### Post

See [IPFS Post](https://github.com/ipfs/post)

- [!] Title
- [!]`id`, a `uuid` hash (unique across `Post`s)
- [!] Sender(s) `iid`
- [!] Recipient(s) `iid`
- Date Created (UTC, epoch)
- Last Modification (default null, merkel-link)

### Task

Schema with a preceding ! (bang) are required. Schema with a ? are discussion points, X denotes skepticism.

- [!] `pid` id/hash => `Post`
- [!] `tid`, a universally unique hash/id across tasks
- [!?] `iid` created by (identity)
- Parents `tid`s (default null); dependencies
- Assigned `iid` (enforce limit of entity as cardinality 1?) 
- Last Modification (default null)
- Start `date` (UTC, epoch?)
- Due `date` (UTC, epoch?)
- [?]`subscribed`, a identity `pid`? an `oid`? (used for pubsub)
- [?]References (a list of `oids`, e.g. attachments -- never mind, these should reference the task maybe?)
- [?]Statuses (`sid`s), e.g. closed, review
- [X]Priority, (should just be inferred from due date, I think)

### Interface

- There’s a global list of all tasks
- There’s a global list of all tasks sent or received by a party
- There’s the ability to assign a task to a 
- There’s an ability to see tasks with a certain "tag"
  - is a tag an identity?
  - does a tag (a view) point-to/ref a task (and other things)?
