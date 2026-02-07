# Project Conventions

To maintain the healthy architectural state of **diskwise**, follow these conventions for all future contributions.

## General Principles

*   **Safety First**: Choosing "do nothing" over a risky action.
*   **Layered Integrity**: Never import from `infra`, `api`, or `cli` into `core`.
*   **Type Safety**: Use Python type hints and TypeScript interfaces for all public signatures.

## Python (Backend) Conventions

*   **Clean Architecture**:
    *   `core/`: Pure logic, no I/O, no `os` or `pathlib` (except for path definitions), no external dependencies.
    *   `infra/`: Implementation of I/O (filesystems, zipping, database).
    *   `api/` / `cli/`: Command/Delivery logic.
*   **Docstrings**: Follow the skill's Python Doc rules.
    ```python
    def my_function(param: str) -> bool:
        """
        Brief description of intent.

        :param param: Description of parameter.
        :return: Description of return value.
        """
    ```

## TypeScript (Frontend) Conventions

*   **Components**: Use functional components with Tailwind for styling.
*   **API Client**: All backend communication must go through `app/src/lib/api.ts`.
*   **Documentation**: Use TSDoc for public interfaces and service methods.

## Environment & Documentation

*   **Secrets**: Use `.env` files. Never commit secrets to Version Control.
*   **Decisions**: Record significant architectural changes in `docs/adr/`.
