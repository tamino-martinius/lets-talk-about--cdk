# Lets Talk About ... AWS Cloud Development Kit

A slide deck exploring different approaches to building AWS infrastructure and why CDK stands out.

## Summary

The talk begins with the **motivation** behind Infrastructure as Code by comparing common approaches:

- **Manual** (AWS Console) -- easy to start but not reproducible and error-prone
- **Scripting** (AWS SDK) -- reproducible, but lacks update/rollback strategies
- **CloudFormation** -- automatable and reproducible, yet verbose with no abstraction
- **DOMs** (e.g. Troposphere) -- real code with desired-state semantics, but limited language support
- **CDK** -- real code, asset management, many supported languages, and desired-state infrastructure

A live **demo** walks through building a multi-route application with CDK, followed by pointers to the [CDK Documentation](https://docs.aws.amazon.com/cdk/api/latest/) and [AWS CDK Examples](https://github.com/aws-samples/aws-cdk-examples).

---

Built with [lets-talk-about](https://github.com/tamino-martinius/lets-talk-about) ([npm](https://www.npmjs.com/package/lets-talk-about)) — a tool for creating slideshows from Markdown.
