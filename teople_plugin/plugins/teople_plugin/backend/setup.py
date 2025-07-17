#!/usr/bin/env python
# import os

# from setuptools import find_packages, setup

# PROJECT_DIR = os.path.dirname(__file__)
# REQUIREMENTS_DIR = os.path.join(PROJECT_DIR, "requirements")
# VERSION = "1.0.0"


# def get_requirements(env):
#     with open(os.path.join(REQUIREMENTS_DIR, f"{env}.txt")) as fp:
#         return [
#             x.strip()
#             for x in fp.read().split("\n")
#             if not x.strip().startswith("#") and not x.strip().startswith("-")
#         ]


# install_requires = get_requirements("base")

# setup(
#     name="teople_plugin",
#     version=VERSION,
#     url="TODO",
#     author="TODO",
#     author_email="TODO",
#     license="TODO",
#     description="TODO",
#     long_description="TODO",
#     platforms=["linux"],
#     package_dir={"": "src"},
#     packages=find_packages("src"),
#     include_package_data=True,
#     install_requires=["baserow"]
# )

#!/usr/bin/env python
# import os
# from setuptools import find_packages, setup

# PROJECT_DIR = os.path.dirname(__file__)
# VERSION = "1.0.0"

# setup(
#     name="teople_plugin",
#     version=VERSION,
#     url="https://github.com/Partya1154/teople-plugin",  # Replace with your repo
#     author="Your Name",
#     author_email="your.email@example.com",
#     license="MIT",  # Recommended for open-source
#     description="Custom Baserow plugin for Teople functionality",
#     long_description=open(os.path.join(PROJECT_DIR, "README.md")).read(),
#     platforms=["linux"],
#     package_dir={"": "src"},
#     packages=find_packages("src"),
#     include_package_data=True,
#     install_requires=[
#         "Django>=3.2",
#         "djangorestframework>=3.12",
#         "baserow>=1.33.4"  # Match your Baserow version
#     ],
#     classifiers=[
#         "Development Status :: 3 - Alpha",
#         "Framework :: Django",
#         "Programming Language :: Python :: 3",
#     ],
#     python_requires=">=3.7",
#     entry_points={
#         "baserow.plugin": [
#             "teople_plugin = teople_plugin.config:TeoplePluginConfig"
#         ]
#     }
# )

from setuptools import setup, find_packages

setup(
    name='teople-plugin',
    version='1.0.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Django>=3.2',
        'baserow>=1.12.0',
    ],
    entry_points={
        'baserow.plugin': 'teople_plugin = teople_plugin.apps:TeoplePluginConfig'
    },
)