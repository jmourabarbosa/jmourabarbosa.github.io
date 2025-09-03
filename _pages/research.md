---
layout: archive
title: ""
permalink: /
author_profile: true
redirect_from: 
  - /research/
  - /research.html
---

<div class="hiring-alert">
  <strong>Open Positions</strong>
  <p>If you are interested in computational neuroscience, machine learning, and working at the intersection of theory and experiments, please contact me with your CV and research interests. Check our publications to understand the type of research we do.</p>
</div>

<div class="page-header">
  <h1 class="page-header__title">Research Interests</h1>
  <p class="page-header__subtitle">We combine machine learning with multiregional theories of decision-making and working memory. Our research focuses on understanding how computations necessary to solve complex tasks can be distributed across segregated brain regions through data-driven approaches and biophysical modeling.</p>
</div>

<div class="research-grid">

  <div class="research-card collapsed">
    <div class="research-card__header">
      <h2 class="research-card__title">Extracting Dynamical Systems from Large-Scale Recordings</h2>
      <div class="research-card__expand-indicator">+</div>
    </div>
    <div class="research-card__expandable">
      <div class="research-card__section">
        <h3 class="research-card__section-title">Motivation</h3>
        <div class="research-card__content">
          Neural computations supporting complex behaviors involve multiple brain regions, and large-scale recordings from animals engaged in complex tasks are increasingly common. A current challenge in analysing these data is to identify which part of the information contained within a brain region is shared with others. For instance, using linear decoding, one might find that a given area encodes all task-related variables but using decoding alone it is hard to identify which variables are actually communicated to a specific downstream area. This is particularly challenging when considering more than two interconnected areas.
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Approach & Findings</h3>
        <div class="research-card__content">
          To address this limitation, we train multi-region recurrent neural networks (RNN) models to reproduce the dynamics of large-scale recordings. This recordings can in principle be of different modalities (single units, fMRI, M/EEG, etc). For instance, we showcase this approach by reproducing the dynamics of more than 6000 neurons across 7 cortical areas from monkeys engaged in a two-dimensional (color and motion direction) context-dependent decision-making task. After fitting, we partition the activity of each area, separating recurrent inputs from those originating in other areas. Decoding analyses show that all areas encode both stimuli (color and direction), but selectively project different dimensions of their activity. Sensory areas (V4, MT and IT) project only one variable (color or direction) while compressing others, irrespective of the context or downstream area. In contrast, we observed that the prefrontal cortex (PFC) and frontal eye fields (FEF) projected different aspects of the stimulus, depending on the downstream area or context. In the model, PFC/FEF strongly compress the irrelevant stimulus dimension in their projections to fronto-parietal areas but not as much towards sensory areas. These preliminary results motivate a novel approach to study how different regions coordinate their activity to solve context-dependent tasks.
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Related Publications</h3>
        <div class="research-card__papers" data-keyword="dynamical-systems">
          <ul class="research-papers-list">
            <li><a href="https://2024.ccneuro.org/pdf/159_Paper_authored_CCN_2024-(1).pdf">Estimating flexible across-area communication with neurally-constrained RNN</a> (CCN, 2024)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="research-card collapsed">
    <div class="research-card__header">
      <h2 class="research-card__title">The Neural Basis of Working Memory</h2>
      <div class="research-card__expand-indicator">+</div>
    </div>
    <div class="research-card__expandable">
      <div class="research-card__section">
        <h3 class="research-card__section-title">Motivation</h3>
        <div class="research-card__content">
          Working memory (WM) is a core function of cognition. This is reflected in the strong correlation between WM performance and other cognitive abilities, notably IQ. Importantly, WM is impaired in major neurological dysfunctions, including schizophrenia. Sustained activity in prefrontal cortex neurons has been regarded as the neural substrate of working memory, but this has been under intense debate in recent years. Alternative proposals suggest that short-term synaptic plasticity also plays a role in supporting working memory.
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Findings</h3>
        <div class="research-card__content">
          In Joao's graduate research, he contributed substantially to this debate by showing that both mechanisms co-exist and interact in the monkey PFC. Moreover, we bridged some insights from biophysical modeling and monkey research directly to experiments with clinical populations (i.e. people with schizophrenia (PSZ) and anti-NMDAR encephalitis).
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Approach</h3>
        <div class="research-card__content">
          We combine biophysical modeling and data analysis of spiking activity from the monkey PFC, human EEG, and TMS, to tackle open questions in working memory research. Data analysis, computational modeling, and human experiments are performed by our team, with EEG experiments designed and collected through direct collaboration.
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Related Publications</h3>
        <div class="research-card__papers" data-keyword="working-memory">
          <ul class="research-papers-list">
            <li><a href="https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3001436">Pinging the brain with visual impulses reveals electrically active, not activity-silent working memories</a> (PLoS Biology, 2021)</li>
            <li><a href="../files/barbosa_interplay.pdf">Interplay between persistent activity and activity-silent dynamics in prefrontal cortex underlies serial biases in working memory</a> (Nature Neuroscience, 2020)</li>
            <li><a href="https://www.nature.com/articles/s41467-020-18033-3">Synaptic basis of reduced serial dependence in anti-NMDAR encephalitis and schizophrenia</a> (Nature Communications, 2020)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="research-card collapsed">
    <div class="research-card__header">
      <h2 class="research-card__title">Neural Basis of Context-Dependent Decision Making</h2>
      <div class="research-card__expand-indicator">+</div>
    </div>
    <div class="research-card__expandable">
      <div class="research-card__section">
        <h3 class="research-card__section-title">Motivation</h3>
        <div class="research-card__content">
          The field of computational neuroscience originates from physics, where there is a strong tradition to model nature from first principles. For instance, we have modeled working memory using ring networks, in which their connectivity structure is designed so that the required attractor dynamics emerges. This approach is extremely successful in modeling simple tasks, but has been proven limited when modeling more complex tasks. This has motivated a new approach, originated instead in Machine Learning, where the connectivity of very flexible neural networks are instead trained to perform arbitrarily complex tasks. We rely heavily on this approach to understand how computations necessary to solve complex tasks can be distributed across segregated brain regions.
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Approach</h3>
        <div class="research-card__content">
          We combine machine learning with multiregional theories of decision-making. Specifically, we extended the framework of low-rank recurrent neural networks (RNN) to model multi-region computations underlying context-dependent behavior. We approach this question in two complementary ways: i) developed statistical methods to fit recurrent neural networks to large-scale recordings (from rats and monkeys) acquired through collaborations and then reverse engineer the dynamical system extracted through gradient descent or ii) use our theoretical intuitions to directly build toy models that explain the neural data.
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Related Publications</h3>
        <div class="research-card__papers" data-keyword="decision-making">
          <ul class="research-papers-list">
            <li><a href="https://www.nature.com/articles/s41467-023-42519-5">Early selection of task-relevant features through population gating</a> (Nature Communications, 2023)</li>
            <li><a href="https://2025.ccneuro.org/abstract_pdf/Abdul_2025_Task-Relevant_Information_Distributed_Across_Cortex_Past.pdf">Task-Relevant Information is Distributed Across the Cortex, but the Past is State-Dependent and Restricted to Frontal Regions</a> (CCN, 2025)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="research-card collapsed">
    <div class="research-card__header">
      <h2 class="research-card__title">Normative Modelling with Recurrent Neural Networks</h2>
      <div class="research-card__expand-indicator">+</div>
    </div>
    <div class="research-card__expandable">
      <div class="research-card__section">
        <h3 class="research-card__section-title">Motivation</h3>
        <div class="research-card__content">
          Traditional approaches to understanding brain function often start with the neural data and try to infer the computation. Normative modelling takes the opposite approach: we start with the computational goal and ask what neural implementation would be optimal. By training recurrent neural networks (RNNs) to perform cognitive tasks under biologically-inspired constraints, we can generate testable predictions about how the brain might solve these problems.
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Approach</h3>
        <div class="research-card__content">
          We develop and apply normative theories using task-optimized RNNs that incorporate biological constraints such as Dale's law, sparse connectivity, and metabolic costs. By systematically varying these constraints and comparing the resulting network solutions to neural data, we can identify which computational principles are fundamental to brain function and which implementation details vary across individuals or brain regions.
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Key Questions</h3>
        <div class="research-card__content">
          <ul>
            <li>What are the optimal neural solutions for cognitive tasks under biological constraints?</li>
            <li>How do different constraints (e.g., energy, connectivity, noise) shape neural computation?</li>
            <li>Can normative models predict individual differences in neural dynamics and behavior?</li>
            <li>How do normative solutions change during development and learning?</li>
          </ul>
        </div>
      </div>
      
      <div class="research-card__section">
        <h3 class="research-card__section-title">Related Publications</h3>
        <div class="research-card__papers" data-keyword="normative-models">
          <ul class="research-papers-list">
            <li><a href="https://www.nature.com/articles/s41467-023-42519-5">Early selection of task-relevant features through population gating</a> (Nature Communications, 2023)</li>
            <li><a href="https://psyarxiv.com/aqc9n/">NeuroGym: An open resource for developing and sharing neuroscience tasks</a> (PsyArxiv, 2022)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

</div>