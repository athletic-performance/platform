# Настройка GitLab для M0

Файлы шаблонов уже лежат в репозитории. Labels, milestone и защита `main`
настраиваются в GitLab UI (или через API) владельцем группы.

## Milestone

Создать milestone:

```text
M0 — Engineering Foundation
```

## Labels

### Status

```text
status::backlog
status::ready
status::in-progress
status::review
status::ready-for-qa
status::in-qa
status::ready-for-release
status::done
```

### Area

```text
area::frontend
area::backend
area::database
area::infrastructure
area::qa
area::docs
```

### Priority

```text
priority::p0
priority::p1
priority::p2
priority::p3
```

### Type

```text
type::task
type::bug
type::decision
```

## Защита `main`

После первого push в `main`:

- запретить прямой push;
- запретить force push;
- изменения только через Merge Request;
- требовать успешный pipeline;
- включить squash merge;
- удалять source branch после merge.

Это должен быть последний прямой push в `main`.

## Шаблоны

- Merge Request: `.gitlab/merge_request_templates/Default.md`
- Issues: `.gitlab/issue_templates/{Task,Bug,Decision}.md`
