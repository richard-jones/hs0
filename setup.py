from setuptools import setup, find_packages

setup(
    name = 'hs0',
    version = '1.0.0',
    packages = find_packages(),
    install_requires = [
        "octopus==1.0.0",
        "esprit",
        "Flask"
    ],
    url = 'http://cottagelabs.com/',
    author = 'Hench Station Zero',
    author_email = 'richard@cottagelabs.com',
    description = 'Hench Station Zero',
    classifiers = [
        'Development Status :: 3 - Alpha',
        'Environment :: Console',
        'Intended Audience :: Developers',
        'License :: Copyheart',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
)
