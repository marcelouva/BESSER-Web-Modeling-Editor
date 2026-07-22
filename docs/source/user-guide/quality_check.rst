Quality Check
=============

The Web Modeling Editor provides two validation modes under **Quality Check**.
Each mode answers a different question about model quality.

What Each Check Validates
-------------------------

Syntactic Check
~~~~~~~~~~~~~~~

- Verifies diagram construction and metamodel rules.
- Validates OCL-related constraints when applicable for the diagram type.
- Returns validation status with detailed errors and warnings.

Semantic Consistency Check
~~~~~~~~~~~~~~~~~~~~~~~~~~

- Available for **Class Diagrams**.
- Translates the class model to Alloy and executes a SAT check.
- Verifies whether at least one valid instance can exist.

Diagram Support Matrix
----------------------

.. list-table::
   :header-rows: 1
   :widths: 35 30 35

   * - Diagram Type
     - Syntactic Check
     - Semantic Consistency Check
   * - Class Diagram
     - Supported
     - Supported
   * - Object Diagram
     - Supported
     - Not supported
   * - State Machine Diagram
     - Supported
     - Not supported
   * - Agent Diagram
     - Supported
     - Not supported
   * - GUI No-Code Diagram
     - Supported
     - Not supported
   * - Quantum Circuit Diagram
     - Supported
     - Not supported
   * - Neural Network Diagram
     - Supported
     - Not supported

Typical Workflow
----------------

1. Run **Syntactic Check** while modeling to catch structural issues early.
2. For class models, run **Semantic Consistency Check** before generation or deployment.
3. If SAT is false, inspect constraints, multiplicities, and OCL invariants.

Result Interpretation
---------------------

- ``sat = true``: the class model is consistent (a valid instance exists).
- ``sat = false``: the class model is inconsistent (no valid instance exists).
- ``sat = null``: consistency could not be determined (for example, unsupported diagram type or missing runtime artifacts).

Troubleshooting
---------------

- If semantic consistency cannot run, ensure Alloy runtime setup is available in the backend environment.
- If syntactic validation fails, fix reported errors first, then retry semantic consistency.
