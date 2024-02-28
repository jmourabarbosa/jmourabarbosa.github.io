---
layout: archive
title: ""
permalink: /research/
author_profile: true
---

Extracting dynamical systems from large-scale recordings.
=====
**Motivation**  
Neural computations supporting complex behaviors involve multiple brain regions, and large-scale recordings from animals engaged in complex tasks are increasingly common. A current challenge in analysing these data is to identify which part of the information contained within a brain region is shared with others. For instance, using linear decoding, one might find that a given area encodes all task-related variables but using decoding alone it is hard to identify which variables are actually communicated to a specific downstream area. This is particularly challenging when considering more than two interconnected areas.

**Summary of approach and findings**   
To address this limitation, we train multi-region recurrent neural networks (RNN) models to reproduce the dynamics of large-scale recordings. This recordings can in principle be of different modalities (single units, fmri, M/EEG, etc). For instance, we show case this apporach by reproducing the dynamics of more than 6000 neurons across 7 cortical areas from monkeys engaged in a two-dimensional (color and motion direction) context-dependent decision-making task. After fitting, we partition the activity of each area, separating recurrent inputs from those originating in other areas. Decoding analyses show that all areas encode both stimuli (color and direction), but selectively project different dimensions of their activity. Sensory areas (V4, MT and IT) project only one variable (color or direction) while compressing others, irrespective of the context or downstream area. In contrast, we observed that the prefrontal cortex (PFC) and frontal eye fields (FEF) projected different aspects of the stimulus, depending on the downstream area or context. In the model, PFC/FEF strongly compress the irrelevant stimulus dimension in their projections to fronto-parietal areas but not as much towards sensory areas. These preliminary results motivate a novel approach to study how different regions coordinate their activity to solve context-dependent tasks. 

The neural basis of working memory.
=====
**Motivation**  
Working memory (WM) is a core function of cognition. This is reflected in the strong correlation between WM performance and other cognitive abilities, notably IQ. Importantly, WM is impaired in major neurological dysfunctions, including schizophrenia. Sustained activity in prefrontal cortex neurons has been regarded as the neural substrate of working memory, but this has been under intense debate in recent years. Alternative proposals suggest that short-term synaptic plasticity also plays a role in supporting working memory. 

**Summary of findings**  
In my graduate research, I contributed substantially to this debate by showing that both mechanisms co-exist and interact in the monkey PFC. Moreover, I bridged some insights from biophysical modeling and monkey research directly to experiments with clinical populations (i.e. people with schizophrenia (PSZ) and anti-NMDAR encephalitis)

**Approach**  
I combined biophysical modeling and data analysis of spiking activity from the monkey PFC, human EEG, and TMS, to tackle open questions in working memory research. Data analysis, computational modeling, and human experiments were performed by me, with the exception of the design of EEG experiments and their data collection, which were done in our lab through direct collaboration. Monkey electrophysiological recordings were outsourced through a collaboration with Wake Forest University, USA.


The neural basis of context-dependent decision making.
=====
**Motivation**  
The field of computational neuroscience originates from physics, where there is a strong tradition to model nature from first principles. For instance, we have modeled working memory using ring networks, in which their connectivity structure is designed so that the required attractor dynamics emerges. This approach is extremely successful in modeling simple tasks, but has been proven limited when modeling more complex tasks. This has motivated a new approach, originated instead in Machine Learning, where the connectivity of very flexible neural networks are instead trained to perform arbitrarily complex tasks. We rely heavily on this approach to understand how computations necessary to solve complex tasks can be distributed across segregated brain regions. 

**Approach**
We combine machine learning with modern multiregional theories of decision-making. Specifically, we extended the framework of low-rank recurrent neural networks (RNN) to model multi-region computations underlying context-dependent behavior. We approach this question in two complementary ways: i) developed statistical methods and fit recurrent neural networks to large-scale recordings (from rats and monkeys) acquired through collaborations and then reverse egineer the dynamical system extracted through gradient descent or ii) use our theoretical intuitions to directly build toy models that explain the neural data. 
